module Tracks
  class DebriefPage < SimpleDelegator
    attr_reader :viewer

    LETTERS = %w[A B C D E F].freeze
    BLIND_STRATEGIES = %w[opus_single sonnet_agent sonnet_agent_advisor].freeze

    def initialize(track, viewer:, debrief_id: nil, reveal: false)
      super(track)
      @viewer = viewer
      @debrief_id = debrief_id
      @reveal = reveal
    end

    def reveal? = @reveal

    delegate :admin?, to: :viewer

    def variants?(debrief) = siblings(debrief).map(&:strategy).uniq.size > 1

    def variant_letter(debrief)
      order = BLIND_STRATEGIES.shuffle(random: Random.new(track.id)) +
              (Track::Debrief::Generation::STRATEGIES.keys - BLIND_STRATEGIES)
      LETTERS[order.index(debrief.strategy)]
    end

    def reveal_details(debrief)
      [debrief.strategy, debrief.model, debrief.cost && format('≈ $%.2f', debrief.cost)].compact.join(' · ')
    end

    def track = __getobj__

    def self.accessible?(_track, viewer) = viewer.admin?

    def self.own?(track, viewer) = track.recorded_by?(viewer) || track.owner == viewer

    def accessible? = self.class.accessible?(track, viewer)

    def readable? = track.public_track? || viewer.admin? || (viewer.registered? && self.class.own?(track, viewer))

    def feedbackable?(debrief) = viewer.admin? || (viewer.registered? && debrief.user_id == viewer.id)

    def available? = Track::Debrief.available_for?(track)

    def catalog = @catalog ||= Track::Debrief::Catalog.new(track, viewer:)

    def debriefs = @debriefs ||= visible_debriefs.latest_first.to_a

    def debrief = @debrief ||= track.debriefs.find(@debrief_id)

    def comparable?(other) = other.present? && (other.public_track? || self.class.own?(other, viewer) || viewer.admin?)

    def visible_debriefs = viewer.admin? ? track.debriefs : track.debriefs.where(user: viewer)

    def siblings(debrief)
      debriefs.select { |item| item.discipline_key == debrief.discipline_key && item.locale == debrief.locale }
    end

    def request!(discipline_key)
      discipline = catalog.find(discipline_key)
      discipline && Track::Debrief.request(track, discipline, user: viewer)
    end

    def compare!(other, from:, to:, focus: 'window')
      return unless comparable?(other)

      comparison = Track::Debrief::Comparison.new(track, other, from:, to:, focus:)
      comparison.valid? && comparison.measured? && Track::Debrief.compare(comparison, user: viewer)
    end
  end
end
