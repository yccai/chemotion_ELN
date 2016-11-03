module Report
  class Delta
    attr_reader :delta, :html

    def initialize(d)
      @delta = d
      @html = deltaToHTML()
    end

    def getHTML
      html
    end

    private
    def deltaToHTML()
      html_string = ""
      delta["ops"].each do |op|
        html_string = html_string + op["insert"]
        case op["attributes"]
          when "link"
          when "color"
          when "bold"
          when "underline"
          when "font"
          else
        end
      end

    end
  end
end
