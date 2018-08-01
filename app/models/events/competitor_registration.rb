module Events
  class CompetitorRegistration
    include ActiveModel::Model

    attr_accessor :id,
                  :event_id,
                  :section_id,
                  :suit_id,
                  :profile_id,
                  :new_profile,
                  :name,
                  :country_id

    validates :section_id, :suit_id, presence: true
    validate :profile_attributes_valid

    def create
      return false unless valid?
      create_competitor
    end

    def update
      return false unless valid?
      update_competitor
    end

    private

    def create_competitor
      Event::Competitor.transaction do
        Event::Competitor.create!(competitor_params)
      end
    end

    def update_competitor
      Event::Competitor.transaction do
        competitor.update!(competitor_params)
      end
    end

    def competitor
      Event::Competitor.find(id)
    end

    def competitor_params
      {
        event_id: event_id,
        section_id: section_id,
        suit_id: suit_id,
        profile: profile
      }
    end

    def profile
      if new_profile?
        build_profile
      else
        Profile.find(profile_id)
      end
    end

    def profile_attributes_valid
      if new_profile?
        errors.add(:name, :blank) if name.blank?
        errors.add(:country_id, :blank) if country_id.blank?
      else
        errors.add(:profile_id, :blank) if profile_id.blank?
      end
    end

    def build_profile
      Profile.create!(
        name: name,
        country_id: country_id,
        owner_type: 'Event',
        owner_id: event_id
      )
    end

    def new_profile?
      new_profile == 'true'
    end
  end
end
