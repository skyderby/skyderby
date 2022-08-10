class Contribution::Summary
  def number_of_contributions_this_month = this_month_contributors.count

  def sample_of_previous_contributions = previous_contributions.sample(10)

  def this_month_contributors
    @this_month_contributors ||=
      Contribution::Detail
      .includes(:contributor)
      .joins(:contribution)
      .merge(Contribution.in_past_days(30))
  end

  def previous_contributions
    @previous_contributions ||=
      Contribution::Detail
      .select('DISTINCT contributor_type, contributor_id')
      .includes(:contributor)
      .joins(:contribution)
      .merge(Contribution.in_past_days(30))
  end

  def this_month_amount = Contribution.in_this_month.sum(:amount)

  def past_90_days_amount = Contribution.in_past_days(90).sum(:amount)

  def past_year_amount = Contribution.in_past_days(365).sum(:amount)
end
