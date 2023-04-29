class TrackFilter
  def initialize(query)
    @query = query
  end

  def apply(relation)
    return relation unless query

    [:profile_id, :suit_id, :place_id].each do |key|
      relation = relation.where({ key => query[key] }) if query[key].present?
    end

    relation = relation.public_send(query[:kind]) if Track.kinds.key? query[:kind]

    relation = relation.search(query[:term]) if query[:term]

    relation
  end

  private

  attr_reader :query
end
