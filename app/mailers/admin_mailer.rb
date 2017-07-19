class AdminMailer < ApplicationMailer
  default to: proc { UserEmailsPresenter.call(User.includes(:profile).admins) }

  def verify_online_competition_result(personal_score)
    @score = personal_score
    @competition_top = PersonalTopScore.where(virtual_competition: @score.virtual_competition).limit(3)

    mail(subject: 'New online competition result requires verification')
  end
end
