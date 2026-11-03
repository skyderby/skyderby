class Profiles::Logbook::Changes
  attr_reader :limit

  def initialize(profile, since: nil, limit: nil)
    @profile = profile
    @since = Sync::Cursor.decode(since)
    @limit = (limit.presence || Sync::DEFAULT_LIMIT).to_i.clamp(1, Sync::DEFAULT_LIMIT)
  end

  def items = rows.first(limit)

  def more? = rows.size > limit

  def cursor
    return Sync::Cursor.for_record(items.last) if more?

    candidate = items.any? ? [Sync::Cursor.for_record(items.last), horizon].min : horizon
    position = [candidate, since].compact.max
    Sync::Cursor.new(time: position.time, id: position.id)
  end

  private

  attr_reader :profile, :since

  def rows
    @rows ||= begin
      scope = profile.jumps.includes(:place, :suit).order(:updated_at, :id).limit(limit + 1)
      scope = scope.where('(jumps.updated_at, jumps.id) > (?, ?)', since.time, since.id) if since
      scope.to_a
    end
  end

  def horizon = @horizon ||= Sync::Cursor.new(time: Sync::COMMIT_OVERLAP.ago, id: 0)
end
