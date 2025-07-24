module PerformanceCompetition::CompetitorsCopy
  extend ActiveSupport::Concern

  def copy_competitors_from!(source_event)
    return if source_event == self

    ActiveRecord::Base.transaction do
      sync_categories_from(source_event)
      sync_competitors_from(source_event)
    end
  end

  private

  def sync_categories_from(source_event)
    source_event.categories.find_each do |source_category|
      categories.find_or_create_by(name: source_category.name) do |category|
        category.order = source_category.order
      end
    end
  end

  def sync_competitors_from(source_event)
    category_mapping = categories.index_by(&:name)

    source_event.competitors.includes(:category).find_each do |source_competitor|
      target_category = category_mapping[source_competitor.category.name]
      next unless target_category

      competitor = competitors.find_or_initialize_by(profile_id: source_competitor.profile_id)
      competitor.assign_attributes(
        section_id: target_category.id,
        suit_id: source_competitor.suit_id,
        assigned_number: source_competitor.assigned_number
      )
      competitor.save!
    end
  end
end
