class ElementPermissionProxy
  attr_reader :user, :element

  def initialize(user, element)
    @user = user
    @element = element
  end

  def serialized
    serializer_class = serializer_class_by_element
    dl = detail_level_for_element
    nested_dl = nested_details_levels_for_element

    serialized_element = restriction_by_dl(serializer_class, dl, nested_dl).deep_symbolize_keys
  end

  private

  def detail_level_for_element
    # on max level everything can be read
    max_detail_level = max_detail_level_by_element_class

    # get collections where element belongs to
    c = user_collections_for_element

    # if user owns none of the collections which include the element, return minimum level
    return 0 if c.empty?

    # Fall 1: User gehört eine unshared Collection, die das Element enthält -> alles
    # Fall 2: User besitzt mindestens einen Share, der das Element enthält...von diesen Shares nutzt man das maximale
    # Element Detaillevel
    if c.pluck(:is_shared).map(&:!).any?
      max_detail_level
    else
      c.public_send(:pluck, "#{element.class.to_s.downcase}_detail_level").max
    end
  end

  def nested_details_levels_for_element
    nested_detail_levels = {}

    c = user_collections_for_element

    nested_detail_levels[:sample] = c.pluck(:sample_detail_level).max
    nested_detail_levels[:wellplate] = c.pluck(:wellplate_detail_level).max
    nested_detail_levels
  end

  def max_detail_level_by_element_class
    case element
    when Sample
      10
    when Reaction
      10
    when Wellplate
      10
    when Screen
      10
    end
  end

  def user_collections_for_element
    collection_ids = element.collections.pluck(:id)
    user_ids = user.groups.pluck(:id) + [user.id]
    Collection.where("id IN (?) AND user_id IN (?)", collection_ids, user_ids)
  end

  def serializer_class_by_element
    case element
    when Sample
      SampleSerializer
    when Reaction
     ReactionSerializer
    when Wellplate
      WellplateSerializer
    when Screen
      ScreenSerializer
    end
  end

  def restriction_by_dl(serializer_class, dl, nested_dl)
    klass = "#{serializer_class}::Level#{dl}".constantize
    klass.new(element, nested_dl).serializable_hash
  end
end
