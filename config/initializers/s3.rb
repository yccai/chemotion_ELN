S3_BUCKET = S3::Service.new(
    :access_key_id => ENV['ACCESS_KEY'],                          
    :secret_access_key => ENV['SECRET_KEY']
  ).buckets.find(ENV['S3_BUCKET'])