class AdminDashboard < Dashboard
  def last_30_days_donations
    Contribution.where(received_at: 30.days.ago..).sum(:amount).round
  end

  def last_year_donations
    Contribution.where(received_at: 1.year.ago..).sum(:amount).round
  end

  def donation_stats
    Contribution
      .joins(:details)
      .select(
        "date_trunc('month', received_at) AS month",
        'count(DISTINCT contribution_details.profile_id) AS people_count',
        'sum(amount) as amount'
      )
      .group("date_trunc('month', received_at)")
      .order(:month)
      .where('received_at > ?', 1.year.ago)
  end
end
