class CollectionSerializer < ActiveModel::Serializer
  attributes :id, :label, :descendant_ids, :is_shared, :shared_by_id, :shared_by_name_abbr,
             :permission_level, :sample_detail_level, :reaction_detail_level, :wellplate_detail_level, :screen_detail_level

  has_many :children

  def children
    object.children.ordered
  end

  def descendant_ids
    object.descendant_ids
  end

  def shared_by_name_abbr
    User.find(object.shared_by_id).name_abbreviation if object.shared_by_id
  end

end
