class TrackFilter
  def initialize(query)
    @query = query
  end

  def tracks = apply(bookmarked? ? Track.viewable : Track.accessible)

  def apply(relation)
    return relation unless query

    relation = apply_filters_by_relations(relation)
    relation = apply_scopes(relation)
    return relation if query[:exclude_id].blank?

    relation.where.not(id: query[:exclude_id])
  end

  def bookmarked? = query.present? && ActiveModel::Type::Boolean.new.cast(query[:bookmarked]).present?

  private

  def apply_filters_by_relations(relation)
    [:profile_id, :suit_id, :place_id].each do |key|
      relation = relation.where({ key => query[key] }) if query[key].present?
    end

    relation
  end

  def apply_scopes(relation)
    relation = relation.public_send(query[:kind]) if Track.kinds.key? query[:kind]
    relation = relation.by_year(query[:year]) if query[:year].present?
    relation = relation.search(query[:term]) if query[:term]
    relation = relation.bookmarked_by(Current.user) if bookmarked?

    relation
  end

  attr_reader :query
end
