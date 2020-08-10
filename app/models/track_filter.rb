class TrackFilter
  def initialize(query)
    @query = query
  end

  def apply(relation)
    return relation unless query

    filter_by_activity(relation)
      .then(&method(:filter_by_associations))
      .then(&method(:filter_by_year))
      .then(&method(:filter_by_term))
  end

  private

  attr_reader :query

  def filter_by_activity(relation)
    return relation unless Track.kinds.key? query[:kind]

    relation.public_send(query[:kind])
  end

  def filter_by_associations(relation)
    [:profile_id, :suit_id, :place_id].inject(relation) do |rel, key|
      next rel if query[key].blank?

      rel.where(Hash[key, query[key]])
    end
  end

  def filter_by_year(relation)
    return relation if query[:year].blank?

    relation.where("DATE_PART('year', recorded_at) IN (?)", query[:year].map(&:to_i))
  end

  def filter_by_term(relation)
    return relation if query[:term].blank?

    relation.search(query[:term])
  end
end
