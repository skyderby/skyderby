class AdminMailer < ApplicationMailer
  default to: proc { UserEmailsPresenter.call(User.includes(:profile).admins) }

  def verify_online_competition_result(track)
    @track = track
    @scores = VirtualCompetition::Standing.podium_places_of(track)
    return if @scores.empty?

    @competitions_top =
      VirtualCompetition::Standing
      .ranked(competition_ids: @scores.map(&:virtual_competition_id).uniq, multi_discipline: false)
      .where(rank: ..VirtualCompetition::Ranking::PODIUM_SIZE)
      .group_by(&:virtual_competition)

    mail(subject: 'New online competition result requires verification')
  end
end
