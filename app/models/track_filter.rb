class TrackFilter
  def initialize(query)
    @query = query
  end

  def apply(relation)
    return relation unless query

    relation = apply_filters_by_relations(relation)

    relation = relation.public_send(query[:kind]) if Track.kinds.key? query[:kind]
    relation = relation.by_year(query[:year]) if query[:year].present?
    relation = relation.search(query[:term]) if query[:term]

    relation
  end

  private

  def apply_filters_by_relations(relation)
    [:profile_id, :suit_id, :place_id].each do |key|
      relation = relation.where({ key => query[key] }) if query[key].present?
    end

    relation
  end

  attr_reader :query
end
