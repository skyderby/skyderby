json.extract! event,
              :id,
              :name,
              :rules,
              :range_from,
              :range_to,
              :status,
              :place,
              :responsible

json.sections event.sections.order(:order), partial: 'sections/section',
                                            as: :section
json.competitors event.competitors, partial: 'competitors/competitor',
                                    as: :competitor

json.tracks event.event_tracks, partial: 'event_tracks/event_track',
                                as: :event_track

json.rounds event.rounds, partial: 'rounds/round', as: :round

json.organizers event.event_organizers, partial: 'event_organizers/event_organizer',
                                        as: :event_organizer
