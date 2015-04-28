class Event < ActiveRecord::Base
  belongs_to :responsible,
             class_name: 'UserProfile',
             foreign_key: 'user_profile_id'

  has_many :event_organizers

  has_many :sections
  has_many :competitors
  has_many :rounds
  has_many :event_tracks, through: :rounds

  enum status: [:draft, :published, :finished]

  scope :available, -> { where('status IN (1, 2)') }
  before_validation :check_name_and_range, on: :create
  validates_presence_of :responsible, :name, :range_from, :range_to

  def self.available_for(user)
    events = Event.order('id DESC')

    events = 
      if user
        if user.has_role? :admin
          events
        else
          profile_id = user.user_profile.id

          events_where_owner = 
            events.where('status IN (1, 2) OR user_profile_id = ?', profile_id)

          events_where_org = 
            events
              .joins(:event_organizers)
              .where(event_organizers: {user_profile_id: profile_id})
          
          (events_where_owner + events_where_org)
            .uniq { |x| x.id }.sort_by { |x| x.id }.reverse
        end
      else
        events.available
      end

    events
  end

  def details
    { 
      id: id.to_s,
      name: name,
      range_from: range_from,
      range_to: range_to,
      status: status,
      place: place,
      sections: sections.order(:order),
      competitors: competitors_info,
      rounds: rounds_by_discipline,
      tracks: event_tracks,
      organizers: event_organizers
    }
  end

  def rounds_by_discipline
    disciplines_rounds = {}
    rounds.each do |round|
      disciplines_rounds[round.discipline] ||= []
      disciplines_rounds[round.discipline] << round
    end
    disciplines_rounds
  end

  def competitors_info
    competitors_details.map do |comp|
      competitor_data(comp).merge(profile_data(comp))
    end
  end

  private

  def check_name_and_range
    self.name ||= Time.now.strftime('%d.%m.%Y') + ': Competition'
    self.range_from ||= 3000
    self.range_to ||= 2000
  end

  def competitors_details
    competitors.includes(:user_profile).includes(:wingsuit).to_a
  end

  def competitor_data(comp)
    { id: comp.id,
      user_id: comp.user_id,
      section_id: comp.section_id,
      wingsuit: comp.wingsuit.name,
      wingsuit_id: comp.wingsuit.id }
  end

  def profile_data(comp)
    { profile_id: comp.user_profile.id,
      name: comp.user_profile.name,
      first_name: comp.user_profile.first_name,
      last_name: comp.user_profile.last_name }
  end
end
