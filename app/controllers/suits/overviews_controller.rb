class Suits::OverviewsController < ApplicationController
  include SuitsContext

  before_action :set_manufacturers, :set_suits_popularity

  def show; end

  private

  def set_suits_popularity
    @suits_popularity =
      Suit
      .joins(:manufacturer)
      .joins("INNER JOIN (#{tracks_query.to_sql}) AS tracks ON tracks.suit_id = suits.id")
      .select(
        :id,
        :name,
        :manufacturer_id,
        'manufacturers.name AS manufacturer_name',
        'round(tracks.count::numeric / sum(tracks.count) OVER () * 100, 2) AS popularity'
      )
      .group(:id, :name, :manufacturer_id, 'manufacturer_name', 'tracks.count')
      .order('popularity desc')
  end

  def tracks_query
    Track
      .where('recorded_at > ?', 1.year.ago.beginning_of_day)
      .where('suit_id IS NOT NULL AND profile_id IS NOT NULL')
      .select('count(distinct profile_id) as count', :suit_id)
      .group(:suit_id)
      .then { |rel| params[:activity].present? ? rel.where(kind: params[:activity]) : rel }
  end
end
