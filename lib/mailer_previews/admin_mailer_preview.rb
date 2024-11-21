class MailerPreviews::AdminMailerPreview < ActionMailer::Preview
  def verify_online_competition_result
    track = PersonalTopScore.where(rank: 1).first.track

    AdminMailer.verify_online_competition_result(track)
  end
end
