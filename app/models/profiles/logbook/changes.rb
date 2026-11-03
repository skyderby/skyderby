class Profiles::Logbook::Changes
  attr_reader :limit

  def initialize(profile, since: nil, limit: nil)
    @profile = profile
    @since = Sync::Cursor.decode(since)
    @limit = (limit.presence || Sync::DEFAULT_LIMIT).to_i.clamp(1, Sync::DEFAULT_LIMIT)
  end

  def items = rows.first(limit)

  def more? = rows.size > limit

  def cursor = Sync::Cursor.following(items.last, more: more?, since:)

  private

  attr_reader :profile, :since

  def rows
    @rows ||= begin
      scope = profile.jumps.includes(:place, :suit).order(:updated_at, :id).limit(limit + 1)
      scope = scope.where('(jumps.updated_at, jumps.id) > (?, ?)', since.time, since.id) if since
      scope.to_a
    end
  end
end
