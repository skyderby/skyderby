class Sync::Feed
  PRELOADS = {
    'places' => { photos: { image_attachment: :blob } }
  }.freeze

  attr_reader :resource, :since, :limit

  def initialize(resource:, since: nil, limit: nil)
    @resource = resource
    @since = Sync::Cursor.decode(since)
    @limit = (limit.presence || Sync::DEFAULT_LIMIT).to_i.clamp(1, Sync::DEFAULT_LIMIT)
  end

  def reset_required? = since&.expired? || false

  def items = rows.first(limit)

  def more? = rows.size > limit

  def deleted_ids
    return [] if since.nil?

    tombstones = Sync::Tombstone.for_resource(resource).where('deleted_at > ?', since.time)
    tombstones = tombstones.where(deleted_at: ..items.last.updated_at) if more?
    tombstones.distinct.order(:record_id).pluck(:record_id)
  end

  def cursor
    return Sync::Cursor.for_record(items.last) if more?

    candidate = items.any? ? [Sync::Cursor.for_record(items.last), horizon].min : horizon
    position = [candidate, since].compact.max
    Sync::Cursor.new(time: position.time, id: position.id)
  end

  private

  def rows
    @rows ||= begin
      scope = model.includes(PRELOADS.fetch(resource, [])).order(:updated_at, :id).limit(limit + 1)
      scope = scope.where("(#{table}.updated_at, #{table}.id) > (?, ?)", since.time, since.id) if since
      scope.to_a
    end
  end

  def model = Sync.resource_class(resource)

  def table = model.quoted_table_name

  def horizon = @horizon ||= Sync::Cursor.new(time: Sync::COMMIT_OVERLAP.ago, id: 0)
end
