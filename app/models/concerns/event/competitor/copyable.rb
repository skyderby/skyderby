module Event::Competitor::Copyable
  extend ActiveSupport::Concern

  class_methods do
    def copy(source_event, target_event)
      source_event.competitors.each do |source_competitor|
        category = target_event.sections
                               .find_by('trim(from lower(name)) = trim(from lower(?))', source_competitor.section.name)
        category ||= target_event.sections.create!(name: source_competitor.section.name)

        existing_competitor = target_event.competitors
                                          .find_by(section: category, profile_id: source_competitor.profile_id)
        next if existing_competitor.present?

        new_record = source_competitor.dup
        new_record.section = category
        new_record.event = target_event
        new_record.save!
      end
    end
  end
end
