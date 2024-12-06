class Contribution::Summary
  def number_of_contributions_this_month = this_month_contributors.count

  def sample_of_previous_contributions = previous_contributions.sample(10)

  def this_month_contributors
    @this_month_contributors ||=
      Contribution::Detail
      .includes(:profile)
      .joins(:contribution)
      .where("contributions.received_at > NOW() - interval '30 days'")
      .order('contributions.received_at DESC')
  end

  def previous_contributions
    @previous_contributions ||=
      Contribution::Detail
      .select('DISTINCT profile_id')
      .includes(:profile)
      .joins(:contribution)
      .where("contributions.received_at <= NOW() - interval '30 days'")
  end
end
