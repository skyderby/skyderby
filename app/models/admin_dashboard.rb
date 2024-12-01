class AdminDashboard < Dashboard
  def last_30_days_donations
    Contribution.where(received_at: 30.days.ago..).sum(:amount).round
  end

  def last_year_donations
    Contribution.where(received_at: 1.year.ago..).sum(:amount).round
  end
end
