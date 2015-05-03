class EventsFinder
  def execute(current_user)
    events = Event.order('id DESC')

    if current_user
      profile_id = current_user.user_profile.id

      if current_user.has_role? :admin
        # Для админов никак не ограничиваем
        events
      elsif current_user.organizer_of_events.any?
        # Если пользователь является организатором как минимум в одном
        # соревновании то отбираем доступные соревнования по следующему условию
        # 1. Соревнования в которых пользователь является организатором
        # 2. Соревнования в которых пользователь является ответственным
        # 3. Все опубликованные и завершенные соревнования
        events.where(
          'id IN (:ids) OR status IN (1, 2) OR user_profile_id = :profile_id', 
          ids: current_user.organizer_of_events,
          profile_id: profile_id
        )
      else
        # Отображаем те в которых ответственным является текущий пользователь
        # и все опубликованные и завершенные соревнования
        events.where('status IN (1, 2) OR user_profile_id = ?', profile_id)
      end
    else
      # Не авторизованным пользователям показываем только 
      # опубликованные и завершенные соревнования
      events.visible
    end
  end
end
