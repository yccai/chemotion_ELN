module AttachmentManager 
  class Uploader
    def self.upload_dir(dir_path)
      Dir.foreach(dir_path) do |filename|
        path = File.join(dir_path, filename)
        next if File.directory? path
        file = File.open(path)
        object = S3_BUCKET.objects.build(file.path)
        object.content = file.read
        object.save
        FileUtils.rm(file.path)
      end
    end
  end

  def self.upload()
    attachments_dir = "uploads/attachments"
    Uploader.upload_dir(attachments_dir)
    thumbnails_dir = "uploads/thumbnails"
    Uploader.upload_dir(thumbnails_dir)
  end
  
  def self.download(path)
    if File.exist? path 
      File.open(path).read
    elsif file = S3_BUCKET.objects.find(path)
      file.content
    else
      nil
    end
  end

end