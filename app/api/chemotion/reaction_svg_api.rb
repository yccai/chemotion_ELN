module Chemotion
  class ReactionSvgAPI < Grape::API
    resource :reaction_svg do
      desc "Get reaction_svg by materials_inchikeys"
      params do
        requires :materials_svg_paths, type: Hash, desc: "Starting-, Reactants, Product-Materials"
        requires :label, type: String, desc: "label which is placed under the reaction-arrow"
      end
      post do
        paths = params[:materials_svg_paths]
        composer = SVG::ReactionComposer.new(paths, label: params[:label])
        filename = composer.compose_reaction_svg_and_save :temp => true
        {:reaction_svg => filename}
      end
    end
  end
end
