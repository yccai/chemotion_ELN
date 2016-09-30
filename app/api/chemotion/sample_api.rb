module Chemotion
  class SampleAPI < Grape::API
    include Grape::Kaminari

    resource :samples do

      # TODO Refactoring: Use Grape Entities
      namespace :ui_state do
        desc "Get samples by UI state"
        params do
          requires :ui_state, type: Hash, desc: "Selected samples from the UI" do
            optional :all, type: Boolean
            optional :included_ids, type: Array
            optional :excluded_ids, type: Array
            optional :collection_id
          end
          optional :limit, type: Integer, desc: "Limit number of samples"
        end

        before do
          error!('401 Unauthorized', 401) unless ElementsPolicy.new(current_user, Sample.for_user(current_user.id).for_ui_state(params[:ui_state])).read?
        end

        # we are using POST because the fetchers don't support GET requests with body data
        post do
          samples = Sample.for_user(current_user.id).for_ui_state(params[:ui_state])
          samples = samples.limit(params[:limit]) if params[:limit]

          {samples: samples.map{|s| SampleSerializer.new(s).serializable_hash.deep_symbolize_keys}}
        end

        desc "Delete samples by UI state"
        params do
          requires :ui_state, type: Hash, desc: "Selected samples from the UI" do
            optional :all, type: Boolean
            optional :included_ids, type: Array
            optional :excluded_ids, type: Array
            optional :collection_id
          end
        end

        before do
          error!('401 Unauthorized', 401) unless ElementsPolicy.new(current_user, Sample.for_user(current_user.id).for_ui_state(params[:ui_state])).destroy?
        end

        delete do
          Sample.for_user(current_user.id).for_ui_state(params[:ui_state]).destroy_all
        end
      end

      namespace :subsamples do
        desc "Split Samples into Subsamples"
        params do
          requires :ui_state, type: Hash, desc: "Selected samples from the UI"
        end
        post do
          ui_state = params[:ui_state]
          currentCollectionId = ui_state[:currentCollectionId]
          sample_ids = Sample.for_user(current_user.id).for_ui_state_with_collection(ui_state[:sample], CollectionsSample, currentCollectionId)
          Sample.where(id: sample_ids).each do |sample|
            subsample = sample.create_subsample current_user, currentCollectionId
          end
        end
      end

      namespace :import do
        desc "Import Samples from a File"
        post do
          # Creates the Samples from the XLS/CSV file. Empty Array if not successful
          import = Import::ImportSamples.import_samples_from_file(params[:file].tempfile.path, params[:currentCollectionId], current_user.id)
        end
      end

      desc "Return serialized molecules_samples_groups  of current user"
      params do
        optional :collection_id, type: Integer, desc: "Collection id"
        optional :sync_collection_id, type: Integer, desc: "SyncCollectionsUser id"
      end
      paginate per_page: 7, offset: 0

      before do
        params[:per_page].to_i > 100 && (params[:per_page] = 100)
      end
      get do
        own_collection = false
        scope = if params[:collection_id]
          begin
            c = Collection.belongs_to_or_shared_by(current_user.id,current_user.group_ids).find(params[:collection_id])
            !c.is_shared && (c.shared_by_id != current_user.id) && (own_collection = true)
            Collection.belongs_to_or_shared_by(current_user.id,current_user.group_ids)
            .find(params[:collection_id]).samples
            .includes(:molecule, :residues, :elemental_compositions, :reactions_product_samples, :reactions_starting_material_samples, :collections)
          rescue ActiveRecord::RecordNotFound
            Sample.none
          end
        elsif params[:sync_collection_id]
          begin
            own_collection = false
            c = current_user.all_sync_in_collections_users.find(params[:sync_collection_id])
            c.collection.samples
            .includes(:molecule, :residues, :elemental_compositions, :reactions_product_samples, :reactions_starting_material_samples, :collections)
          rescue ActiveRecord::RecordNotFound
            Sample.none
          end
        else
          # All collection
          own_collection = true
          Sample.for_user(current_user.id).includes(:molecule).uniq
        end.uniq.not_reactant.not_solvents.order("updated_at DESC")

        return {
          molecules: group_by_molecule(paginate(scope),own_collection)
        }
      end

      desc "Return serialized sample by id"
      params do
        requires :id, type: Integer, desc: "Sample id"
      end
      route_param :id do
        before do
          error!('401 Unauthorized', 401) unless ElementPolicy.new(current_user, Sample.find(params[:id])).read?
        end

        get do
          sample= Sample.includes(:molecule, :residues, :elemental_compositions)
                         .find(params[:id])
          {sample: ElementPermissionProxy.new(current_user, sample, user_ids).serialized}
        end
      end

      #todo: move to AttachmentAPI
      desc "Upload attachments"
      post 'upload_dataset_attachments' do

        params.each do |file_id, file|
            if tempfile = file.tempfile
            begin
            #Test
              db_attachment = Attachment.where(identifier: file_id)

              storage = Filesystem.new
              storage.create(current_user, db_attachment, tempfile)
            ensure
              tempfile.close
              tempfile.unlink   # deletes the temp file
            end
          end
        end
        true
      end

      #todo: authorize attachment download
      desc "Download the attachment file"
      params do
        optional :filename, type: String
      end
      get 'download_attachement/:attachment_id' do
        file_id = params[:attachment_id]
        filename = params[:filename] || file_id
        content_type "application/octet-stream"
        header['Content-Disposition'] = "attachment; filename=#{filename}"
        env['api.format'] = :binary
        File.open(File.join('uploads', 'attachments', "#{file_id}#{File.extname(filename)}")).read

        #attachment = Attachment.find(params[:attachment_id])
        #storage = Filesystem.new
        #storage.read(current_user, attachment)
      end

      module SampleUpdator

        def self.updated_embedded_analyses(analyses)

          Array(analyses).map do |ana|
            {
              id: ana.id,
              type: ana.type,
              name: ana.name,
              kind: ana.kind,
              status: ana.status,
              content: ana.content,
              description: ana.description,
              datasets: Array(ana.datasets).map do |dataset|
                {

                  id: dataset.id,
                  type: dataset.type,
                  name: dataset.name,
                  instrument: dataset.instrument,
                  description: dataset.description,
                  attachments: Array(dataset.attachments).map do |attachment|
                    if(attachment.file)
                      {
                        id: attachment.id,
                        name: attachment.name,
                        filename: attachment.file.id
                      }
                    else
                      {
                        id: attachment.id,
                        name: attachment.name,
                        filename: attachment.filename
                      }
                    end
                  end
                }
              end
            }
          end
        end

        def self.updated_analyses(sample, analyses)
          root_container = sample.container

          analyses.map do |ana|
            puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Gibt es Container in DB: " + ana.id
            if Container.exists?(:identifier => ana.id)
              puts "Ja es gibt Container: " + ana.id
              puts "Lese Container aus Datenbank"
              ana_container = Container.find_by identifier: ana.id
            else
              puts "Nein noch kein Eintrag"
              ana_container = Container.create! :name => ana.name, :parent => root_container
              ana_container.identifier = ana.id
            end
            ana_container.save

            #Datasets
            ana.datasets.map do |dataset|
              puts "Gibt es Datasets in DB: " + dataset.id
              if Container.exists?(:identifier => dataset.id)
                puts "Ja es gibt Dataset in DB"

                data_container = Container.find_by identifier: dataset.id
             else
               puts "Nein noch kein Eintrag"
               data_container = Container.create! :name => dataset.name, :parent => ana_container
               data_container.identifier = dataset.id
             end
             data_container.save
             dataset.attachments.each do |attachment|
               attachment_link = Attachment.where(identifier: attachment.id).first_or_create
               if(attachment.file)
                   attachment_link.filename = attachment.file.id
               else
                  attachment_link.filename = attachment.filename
              end
               attachment_link.container = data_container
              attachment_link.save
              end
            end
          end
          #End New
        end
      end

      desc "Update sample by id"
      params do
        requires :id, type: Integer, desc: "Sample id"
        optional :name, type: String, desc: "Sample name"
        optional :external_label, type: String, desc: "Sample external label"
        optional :imported_readout, type: String, desc: "Sample Imported Readout"
        optional :target_amount_value, type: Float, desc: "Sample target amount_value"
        optional :target_amount_unit, type: String, desc: "Sample target amount_unit"
        optional :real_amount_value, type: Float, desc: "Sample real amount_value"
        optional :real_amount_unit, type: String, desc: "Sample real amount_unit"
        optional :description, type: String, desc: "Sample description"
        optional :purity, type: Float, desc: "Sample purity"
        optional :solvent, type: String, desc: "Sample solvent"
        optional :impurities, type: String, desc: "Sample impurities"
        optional :location, type: String, desc: "Sample location"
        optional :molfile, type: String, desc: "Sample molfile"
        optional :sample_svg_file, type: String, desc: "Sample SVG file"
        optional :molecule, type: Hash, desc: "Sample molecule"
        optional :is_top_secret, type: Boolean, desc: "Sample is marked as top secret?"
        optional :density, type: Float, desc: "Sample density"
        optional :boiling_point, type: Float, desc: "Sample boiling point"
        optional :melting_point, type: Float, desc: "Sample melting point"
        optional :analyses, type: Array
        optional :residues, type: Array
        optional :elemental_compositions, type: Array
      end
      route_param :id do
        before do
          error!('401 Unauthorized', 401) unless ElementPolicy.new(current_user, Sample.find(params[:id])).update?
        end

        put do
          attributes = declared(params, include_missing: false)
          embedded_analyses = SampleUpdator.updated_embedded_analyses(params[:analyses])
          attributes.merge!(analyses: embedded_analyses)

          # otherwise ActiveRecord::UnknownAttributeError appears
          attributes[:elemental_compositions].each do |i|
            i.delete :description
          end if attributes[:elemental_compositions]

          # set nested attributes
          %i(molecule residues elemental_compositions).each do |prop|
            prop_value = attributes.delete(prop)
            attributes.merge!(
              "#{prop}_attributes".to_sym => prop_value
            ) unless prop_value.blank?
          end

          if sample = Sample.find(params[:id])
            sample.update(attributes)
            SampleUpdator.updated_analyses(sample, params[:analyses])
          end
          {sample: ElementPermissionProxy.new(current_user, sample, user_ids).serialized}
        end
      end

      desc "Create a sample"
      params do
        optional :name, type: String, desc: "Sample name"
        optional :short_label, type: String, desc: "Sample short label"
        optional :external_label, type: String, desc: "Sample external label"
        optional :imported_readout, type: String, desc: "Sample Imported Readout"
        requires :target_amount_value, type: Float, desc: "Sample target amount_value"
        requires :target_amount_unit, type: String, desc: "Sample target amount_unit"
        optional :real_amount_value, type: Float, desc: "Sample real amount_value"
        optional :real_amount_unit, type: String, desc: "Sample real amount_unit"
        requires :description, type: String, desc: "Sample description"
        requires :purity, type: Float, desc: "Sample purity"
        requires :solvent, type: String, desc: "Sample solvent"
        requires :impurities, type: String, desc: "Sample impurities"
        requires :location, type: String, desc: "Sample location"
        optional :molfile, type: String, desc: "Sample molfile"
        optional :sample_svg_file, type: String, desc: "Sample SVG file"
        optional :molecule, type: Hash, desc: "Sample molecule"
        optional :collection_id, type: Integer, desc: "Collection id"
        requires :is_top_secret, type: Boolean, desc: "Sample is marked as top secret?"
        optional :density, type: Float, desc: "Sample density"
        optional :boiling_point, type: Float, desc: "Sample boiling point"
        optional :melting_point, type: Float, desc: "Sample melting point"
        optional :analyses, type: Array
        optional :residues, type: Array
        optional :elemental_compositions, type: Array
      end
      post do
        attributes = {
          name: params[:name],
          short_label: params[:short_label],
          target_amount_value: params[:target_amount_value],
          target_amount_unit: params[:target_amount_unit],
          real_amount_value: params[:real_amount_value],
          real_amount_unit: params[:real_amount_unit],
          description: params[:description],
          purity: params[:purity],
          solvent: params[:solvent],
          impurities: params[:impurities],
          location: params[:location],
          molfile: params[:molfile],
          sample_svg_file: params[:sample_svg_file],
          is_top_secret: params[:is_top_secret],
          analyses: SampleUpdator.updated_embedded_analyses(params[:analyses]),
          residues: params[:residues],
          elemental_compositions: params[:elemental_compositions],
          created_by: current_user.id
        }

        # otherwise ActiveRecord::UnknownAttributeError appears
        attributes[:elemental_compositions].each do |i|
          i.delete :description
        end if attributes[:elemental_compositions]

        # set nested attributes
        %i(molecule residues elemental_compositions).each do |prop|
          prop_value = attributes.delete(prop)
          attributes.merge!(
            "#{prop}_attributes".to_sym => prop_value
          ) unless prop_value.blank?
        end

        sample = Sample.new(attributes)

        if params[:collection_id]
          collection = current_user.collections.find(params[:collection_id])
          sample.collections << collection
        end

        all_coll = Collection.get_all_collection_for_user(current_user.id)
        sample.collections << all_coll

        root_container = Container.new
        root_container.name = "root"
        root_container.save!

        sample.container = root_container

        sample.save!



        sample
      end

      desc "Delete a sample by id"
      params do
        requires :id, type: Integer, desc: "Sample id"
      end
      route_param :id do
        before do
          error!('401 Unauthorized', 401) unless ElementPolicy.new(current_user, Sample.find(params[:id])).destroy?
        end

        delete do
          Sample.find(params[:id]).destroy
        end
      end
    end
  end
end
