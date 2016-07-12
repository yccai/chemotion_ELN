class Report::ExcelExport
  def initialize
    @@sample_list = Array.new
  end

  def add_sample(sample)
    @@sample_list << sample
  end

  def generate_file
    p = Axlsx::Package.new

    img = File.expand_path('../image1.jpeg', __FILE__)

    p.workbook.styles.fonts.first.name = 'Calibri'
    p.workbook.add_worksheet(:name => "ChemOffice") do |sheet|
      sheet.add_row ["", "", "", "", "", ""]
      sheet.add_row ["Bild", "", "", "Name", "Short Label", "Smiles Code"], :b => true, :sz => 12

      width = 0
      files = [] # do not let Tempfile object to be garbage collected
      @@sample_list.compact.each_with_index do |sample, row|
        sample_info = Chemotion::OpenBabelService.molecule_info_from_molfile sample.molecule.molfile
        svg_path = Rails.root.to_s + '/public' + sample.get_svg_path
        image_data = get_image_from_svg(svg_path, files)
        sheet.add_image(:image_src => image_data[:path], :noMove => true) do |image|
          image.width = image_data[:width]
          image.height = image_data[:height]
          image.start_at 0, row + 2
        end

        sheet.add_row ["", "A", row+1, sample_info[:title_legacy], sample_info[:formula], sample_info[:smiles]], :sz => 12, :height => image_data[:height] * 3/4 # 3/4 -> The misterious ratio!

        if image_data[:width] > width # Get the biggest image size to set the column
          width = image_data[:width]
        end
      end

      sheet.column_info.first.width = width/8 # 1/8 -> The second misterious ratio (library bug?)
    end

    p.to_stream().read()
  end

  def generate_full_file
    p = Axlsx::Package.new

    img = File.expand_path('../image1.jpeg', __FILE__)

    p.workbook.styles.fonts.first.name = 'Calibri'
    p.workbook.add_worksheet(:name => "ChemOffice") do |sheet|
      header = [""] + @@sample_list.first.attributes.keys
      # Add header
      sheet.add_row header

      width = 0
      files = [] # do not let Tempfile object to be garbage collected

      @@sample_list.compact.each_with_index do |sample, row|
        svg_path = Rails.root.to_s + '/public' + sample.get_svg_path
        image_data = get_image_from_svg(svg_path, files)
        img_src = image_data[:path]
        sheet.add_image(:image_src => img_src,:noMove => true) do |img|
          img.width = image_data[:width]
          img.height = image_data[:height]
          img.start_at 0, row + 1
        end

        # 3/4 -> The misterious ratio!
        # See column explanation below
        data_hash = [""]
        (1..header.length - 1).each do |index|
          key = header[index]
          data_hash << sample.attributes[key]
        end
        sheet.add_row data_hash,
                      :sz => 12,
                      :height => image_data[:height] * 3/4

        # Get the biggest image size to set the column
        if image_data[:width] > width
          width = image_data[:width]
        end
      end

      # 1/8 -> The second misterious ratio (library bug?)
      # The creator mentioned about this
      # https://github.com/randym/axlsx/issues/125#issuecomment-16834367
      sheet.column_info.first.width = width/8
    end

    p.to_stream().read()
  end

  def get_image_from_svg(svg_path, files)
    image = Magick::Image.read(svg_path) { self.format = 'SVG'; }.first
    image.format = 'png'
    png_blob = image.to_blob

    width = image.columns
    height = image.rows

    file = Tempfile.new(['image', '.png'])
    file.binmode
    file.write png_blob
    file.flush
    file.close
    files << file # do not let Tempfile object to be garbage collected

    return {path: file.path, width: width, height: height}
  end
end
