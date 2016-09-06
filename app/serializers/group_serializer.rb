class GroupSerializer < ActiveModel::Serializer
  attributes :id, :name, :initials, :samples_count, :reactions_count
  has_many :users,  :serializer => UserSerializer
  has_many :admins,  :serializer => UserSerializer

  def samples_count
    object.counters['samples'].to_i
  end

  def reactions_count
    object.counters['reactions'].to_i
  end
end
