class AdminMailerPreview < ActionMailer::Preview
  def verify_online_competition_result
    top_score = PersonalTopScore.where(rank: 1).first

    AdminMailer.verify_online_competition_result(top_score)
  end
end
