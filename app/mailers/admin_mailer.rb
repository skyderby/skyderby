class AdminMailer < ApplicationMailer
  default to: proc { UserEmailsPresenter.call(User.includes(:profile).admins) }

  def verify_online_competition_result(track)
    @track = track
    @scores = PersonalTopScore.where(track: track).where('rank <= 3')
    @competitions_top = PersonalTopScore.where(virtual_competition: @scores.map(&:virtual_competition_id)).where('rank <= 3').group_by(&:virtual_competition)

    mail(subject: 'New online competition result requires verification')
  end
end
