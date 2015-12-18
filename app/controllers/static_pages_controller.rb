# encoding: utf-8
class StaticPagesController < ApplicationController
  def index
    @track = Track.new
    results =
      VirtualCompResult
      .joins(:virtual_competition)
      .joins(:user_profile)
      .where('virtual_competitions.display_on_start_page = ?', true)
      .group(:user_profile_id, :virtual_competition_id)
      .order(:virtual_competition_id, 'result DESC')
      .pluck_to_hash(
        'virtual_competitions.name as virtual_competition_name',
        'CASE
          WHEN virtual_competitions.jumps_kind = 0
            THEN "Skydive challenge"
          ELSE "BASE Challenge"
        END as competition_group',
        :virtual_competition_id,
        :user_profile_id,
        'user_profiles.name as user_profile_name',
        'MAX(result) as result')

    @competition_results = results.group_by { |x| x[:competition_group] }
    # grouped.each do |_, res|
    #   place = 1
    #   res.each do |r|
    #     r[:place] = place
    #     place += 1
    #   end
    # end
    #
    # VirtualCompetition.includes(:virtual_comp_results)
    #                   .includes(virtual_comp_results: :user_profile)
    #                   .where(display_on_start_page: true)
    #                   .order('id DESC')
    #                   .group_by(&:jumps_kind)
  end

  def manage
    authorize! :manage, :all
  end

  def terms
  end

  def about
  end

  def competitions
    @summary = Skyderby::CompetitionsSummary.new
  end
end
