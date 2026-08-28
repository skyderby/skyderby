module Tracks
  class UploadStats
    MONTHS_SHOWN = 12
    MONTH = Arel.sql("date_trunc('month', tracks.created_at)::date")
    SUBSCRIBED = Arel.sql("users.subscribed AND NOT ('admin' = ANY(users.roles))")
    PARTIAL_MONTH_TAIL = <<~SQL.squish
      date_trunc('month', tracks.created_at)::date IN (:months)
      AND tracks.created_at >= date_trunc('month', tracks.created_at)
                               + make_interval(secs => :elapsed)
    SQL

    Bucket = Data.define(:kind, :pro, :free, :previous) do
      def uploaders = pro + free

      def delta = uploaders - previous

      def label = kind&.humanize || 'All'
    end

    Month = Data.define(:date, :previous_date, :partial, :total, :kinds) do
      def partial? = partial
    end

    def initialize(now = Time.current)
      @now = now
    end

    def months
      @months ||= window.map { |date| build_month(date) }
    end

    def max
      @max ||= months.flat_map(&:kinds)
                     .flat_map { |bucket| [bucket.uploaders, bucket.previous] }
                     .max
                     .then { |value| [value.to_i, 1].max }
    end

    private

    attr_reader :now

    def window
      Array.new(MONTHS_SHOWN) { |offset| current_month - offset.months }
    end

    def current_month = now.beginning_of_month.to_date

    def partial_months = [current_month, current_month - 1.year]

    def build_month(date)
      previous_date = date - 1.year

      Month.new(
        date: date,
        previous_date: previous_date,
        partial: date == current_month,
        total: bucket(nil, date, previous_date),
        kinds: Track.kinds.keys.map { |kind| bucket(kind, date, previous_date) }
      )
    end

    def bucket(kind, date, previous_date)
      counts = kind ? uploaders_by_kind : uploaders_by_month
      key = ->(month, subscribed) { kind ? [month, kind, subscribed] : [month, subscribed] }

      Bucket.new(
        kind: kind,
        pro: counts[key.call(date, true)].to_i,
        free: counts[key.call(date, false)].to_i,
        previous: counts[key.call(previous_date, true)].to_i +
                  counts[key.call(previous_date, false)].to_i
      )
    end

    def uploaders_by_kind
      @uploaders_by_kind ||= uploaders.group(MONTH, :kind, SUBSCRIBED).count('tracks.owner_id')
    end

    def uploaders_by_month
      @uploaders_by_month ||= uploaders.group(MONTH, SUBSCRIBED).count('tracks.owner_id')
    end

    def uploaders
      Track
        .joins('INNER JOIN users ON users.id = tracks.owner_id')
        .where(owner_type: 'User')
        .where(created_at: (current_month - (MONTHS_SHOWN + 11).months)...now)
        .where.not(PARTIAL_MONTH_TAIL, months: partial_months, elapsed: now - now.beginning_of_month)
        .distinct
    end
  end
end
