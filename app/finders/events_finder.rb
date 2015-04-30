class EventsFinder
  def execute(current_user)
    events = Event.order('id DESC')

    events = 
      if current_user
        if current_user.has_role? :admin
          events
        else
          profile_id = current_user.user_profile.id

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
end
