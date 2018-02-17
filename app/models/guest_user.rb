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

  def registered?
    false
  end

  def has_role?(*_args)
    false
  end

  def profile
    nil
  end

  def organizer_of_events
    []
  end

  def responsible_of_events
    []
  end

  def participant_of_events
    []
  end
end
