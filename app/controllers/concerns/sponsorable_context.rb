module SponsorableContext
  extend ActiveSupport::Concern

  def set_sponsorable
    @sponsorable = sponsorable_class.find(params["#{sponsorable_class.name.underscore}_id"])
  end

  def sponsorable_class
    [Event, SpeedSkydivingCompetition, Tournament, VirtualCompetition]
      .detect { |c| params["#{c.name.underscore}_id"] }
  end

  def authorize_sponsorable
    return if policy(@sponsorable).update?

    raise Pundit::NotAuthorizedError
  end

  def broadcast_sponsors_update
    Turbo::StreamsChannel.broadcast_replace_to(
      [@sponsorable, :sponsors, :editable],
      target: "#{@sponsorable.class.name.underscore}_#{@sponsorable.id}_sponsors",
      partial: 'sponsors/list',
      locals: { sponsorable: @sponsorable, editable: !@sponsorable.finished? }
    )

    Turbo::StreamsChannel.broadcast_replace_to(
      [@sponsorable, :sponsors, :read_only],
      target: "#{@sponsorable.class.name.underscore}_#{@sponsorable.id}_sponsors",
      partial: 'sponsors/list',
      locals: { sponsorable: @sponsorable, editable: false }
    )
  end
end
