module Tournament::CompetitorsCopy
  extend ActiveSupport::Concern

  def copy_competitors_from!(source_tournament)
    return if source_tournament == self

    ActiveRecord::Base.transaction do
      source_tournament.competitors.includes(:profile).find_each do |source_competitor|
        competitor = competitors.find_or_initialize_by(profile_id: source_competitor.profile_id)
        competitor.suit_id = source_competitor.suit_id
        competitor.save!
      end
    end
  end
end
