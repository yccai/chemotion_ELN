class ElementPermissionProxy
  attr_reader :user, :element

  def initialize(user, element, user_ids = [])
    @user = user
    @element = element
    @user_ids = user_ids

    @collections = user_collections_for_element
    @sync_collections = sync_collections_users_for_element
  end

  def serialized
    serializer_class = serializer_class_by_element
    detail_level_for_element
    nested_dl = nested_details_levels_for_element

    serialized_element = restriction_by_dl(serializer_class, @dl, nested_dl).deep_symbolize_keys
  end

  private

  def detail_level_for_element
    # on max level everything can be read
    max_detail_level = max_detail_level_by_element_class
    # get collections where element belongs to
    c = @collections
    sc= @sync_collections
    # if user owns none of the collections which include the element, return minimum level
    @dl = 0
    return @dl if c.empty? && sc.empty?

    # Fall 1: User gehört eine unshared Collection, die das Element enthält -> alles
    # Fall 2: User besitzt mindestens einen Share, der das Element enthält...von diesen Shares nutzt man das maximale
    # Element Detaillevel

    c.public_send(:pluck, :is_shared,"#{element.class.to_s.downcase}_detail_level").each do |bool, dl|
      return (@dl = max_detail_level) if !bool
      @dl = dl if dl > @dl
    end

    sc.public_send(:pluck, "#{element.class.to_s.downcase}_detail_level").each do | dl|
      @dl = dl if dl > @dl
    end

    @dl

  end

  def nested_details_levels_for_element
    nested_detail_levels = {}
    c = @collections
    s_dl,w_dl= 0,0
    if element.is_a?(Sample)
      nested_detail_levels[:sample] = @dl
      nested_detail_levels[:wellplate] = c.pluck(:wellplate_detail_level).max
    else
      c.pluck(:sample_detail_level,:wellplate_detail_level).each do |dls|
        s_dl < dls[0] && (s_dl = dls[0])
        w_dl < dls[1] && (w_dl = dls[1])
      end
      nested_detail_levels[:sample], nested_detail_levels[:wellplate] = s_dl, w_dl
    end
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
  #    collection_ids = element.collections.pluck(:id)
  #    Collection.where("id IN (?) AND user_id IN (?)", collection_ids, @user_ids)
      element.collections.where("user_id IN (?)",  @user_ids)
  end
  def sync_collections_users_for_element
    coll_ids = element.collections.pluck :id
    SyncCollectionsUser.where("collection_id IN (?) and user_id IN (?)",coll_ids, @user_ids)
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
