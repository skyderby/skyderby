module Profiles
  class Logbook < SimpleDelegator
    KINDS = %w[skydive base].freeze
    PER_PAGE = 50

    def initialize(profile, kind: nil, year: nil, page: nil)
      super(profile)
      @requested_kind = kind.to_s
      @year = year.presence&.to_i
      @page = page
    end

    attr_reader :year

    def profile = __getobj__

    def kind
      @kind ||=
        if @requested_kind == 'speed_skydiving' then 'skydive'
        elsif KINDS.include?(@requested_kind) then @requested_kind
        else default_kind
        end
    end

    def kinds = KINDS

    def entries
      @entries ||= filtered.chronologically.includes(:place, :suit, :track).page(@page).per(PER_PAGE)
    end

    def latest = @latest ||= scope.chronologically.includes(:place).first

    def empty? = !scope.exists?

    def total_jumps = scope.maximum(:number) || scope.count

    def jumps_this_year = scope.where(jumped_at: Time.current.all_year).count

    def freefall_seconds = scope.sum(:freefall_seconds)

    def canopy_seconds = scope.sum(:canopy_seconds)

    def object_counts = scope.base.where.not(object_type: nil).group(:object_type).count

    def years
      scope.distinct.pluck(Arel.sql('EXTRACT(YEAR FROM jumped_at)::integer')).sort.reverse
    end

    def needs_number_count = scope.where(number: nil).count

    def duplicate_numbers
      @duplicate_numbers ||= scope.numbered.group(:number).having('COUNT(*) > 1').pluck(:number).to_set
    end

    def new_entry
      last = latest
      jumps.new(
        kind:,
        number: Jump.next_number(profile, kind),
        jumped_at: Time.current.change(sec: 0),
        place_id: last&.place_id,
        place_name: last&.place_name,
        suit_id: last&.suit_id,
        equipment: last_equipment,
        aircraft: last&.aircraft,
        jump_type: last&.jump_type
      )
    end

    def importable_tracks
      tracks
        .where(kind: kind == 'base' ? :base : %i[skydive speed_skydiving])
        .where.not(id: jumps.kept.where.not(track_id: nil).select(:track_id))
    end

    def import_years
      importable_tracks.distinct
                       .pluck(Arel.sql('EXTRACT(YEAR FROM COALESCE(recorded_at, created_at))::integer'))
                       .sort.reverse
    end

    def import_candidates(year)
      importable_tracks
        .where('EXTRACT(YEAR FROM COALESCE(recorded_at, created_at)) = ?', year)
        .includes(:place, :suit)
        .order(Arel.sql('COALESCE(exited_at, recorded_at, created_at) DESC'))
    end

    private

    def scope = jumps.kept.where(kind:)

    def last_equipment = scope.where.not(equipment: [nil, '']).chronologically.pick(:equipment)

    def filtered
      return scope unless year

      scope.where('EXTRACT(YEAR FROM jumped_at) = ?', year)
    end

    def default_kind
      only_base = jumps.kept.base.exists? && !jumps.kept.skydive.exists?
      only_base ? 'base' : 'skydive'
    end
  end
end
