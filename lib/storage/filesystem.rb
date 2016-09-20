
class Filesystem

  def initialize
    @upload_root_folder = "uploadNew8"
    @attachment_folder = "attachments"
    @thumbnail_folder = "thumbnails"
  end

  def create(file_id, file)
    upload_file_path = File.join(@upload_root_folder, @attachment_folder, "#{file_id}#{File.extname(file)}")
    upload_attachment_dir = File.join(@upload_root_folder, @attachment_folder)
    upload_thumbnail_dir = File.join(@upload_root_folder, @thumbnail_folder)

    begin
      FileUtils.mkdir_p(upload_attachment_dir) unless Dir.exist?(upload_attachment_dir)
      FileUtils.mkdir_p(upload_thumbnail_dir) unless Dir.exist?(upload_thumbnail_dir)
     rescue
        #Couldn't create folders
      else
        begin
          #FileUtils.cp(file.path, upload_file_path)
          IO.binwrite(upload_file_path, file)
        rescue
          #Couldn't write files
        else
          #Everything is fine
          newAttachment = Attachment.new
          newAttachment.filename = file_id
          #Further metadata...
          newAttachment.save
        end
    ensure
    file.close
    end
    return newAttachent
  end

  def create_thumbnail(file_id, file_path)
    begin
      thumbnail_path = Thumbnailer.create(file_path)
      FileUtils.mv(thumbnail_path, File.join(@upload_root_folder, @thumbnail_folder, "#{file_id}.png"))
    rescue
      #Thumbnail konnte nicht erzeugt werden
      puts "Thumbnail Fehler !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    end
  end
end
