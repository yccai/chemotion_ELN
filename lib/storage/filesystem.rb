
class Filesystem

  def initialize
    @upload_root_folder = "uploadNew4711"
    @attachment_folder = "attachments"
    @thumbnail_folder = "thumbnails"
  end

  def create(user, db_attachment, file)

    begin
      container = Container.where(id: db_attachment.container_id)
      upload_dir = getPath(user, container)
      FileUtils.mkdir_p(upload_dir) unless Dir.exist?(upload_dir)
     rescue
        #Couldn't create folders
        puts "DO SOMTHING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        db_attachment.delete
      else
        begin
          upload_file_path = File.join(upload_dir, "#{file_id}#{File.extname(file)}")
          IO.binwrite(upload_file_path, file)
        rescue
          #Couldn't write files
          db_attachment.delete
        else
          #Everything is fine
          #newAttachment = Attachment.new
          #newAttachment.filename = file_id
          #newAttachment.container_id = container.id
          #newAttachment.save


          #create thumbnail
          #
        end
    ensure
    file.close
    end
    #return newAttachment
  end

  #def read(user, attachment)
  #  dir = getPath(user)
  #  file_path = File.join(dir, attachment.filename)

  #  begin
  #    return IO.binread(file_path)
  #  end
  #end


  private
  def getPath(user, container)
    container_path = container.id.to_s
    while container.parentFolder.to_i > 0 do
      container = Container.find(container.parentFolder)
      container_path = File.join(container.id.to_s, container_path)
    end
    tmpPath = File.join(@upload_root_folder, user.id.to_s, container_path)

    return tmpPath
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
