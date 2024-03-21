class GuestUser
  class TrackCollection
    delegate :include?, to: :collection

    def initialize(store)
      @store = store
    end

    def <<(id)
      store.signed[:track_ids] = (collection << id).to_s
    end

    private

    attr_reader :store

    def collection
      stored_ids = store.signed[:track_ids]

      return [] if stored_ids.blank?

      JSON.parse(stored_ids)
    end
  end

  attr_reader :tracks

  def initialize(store)
    @tracks = TrackCollection.new(store)
  end

  def id = nil

  def registered? = false

  def role?(_role) = false

  def admin? = false

  def profile = nil

  def organizer_of_events = []

  def organizer_of_event?(_event) = false

  def responsible_of_events = []

  def participant_of_events = []
end
