class TrackFilter
  def initialize(query)
    @query = query
  end

  def apply(relation)
    return relation unless query

    [:profile_id, :wingsuit_id, :place_id].each do |key|
      next if query[key].blank?
      relation = relation.where(Hash[key, query[key]] ) 
    end

    if query[:kind]
      relation = relation.base if query[:kind] == 'base'
      relation = relation.skydive if query[:kind] == 'skydive'
    end

    relation = relation.search(query[:term]) if query[:term]

    relation
  end

  private

  attr_reader :query
end
