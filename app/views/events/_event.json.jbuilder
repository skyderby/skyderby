json.extract! event, :id, :name, :range_from, :range_to, :status, :place
json.sections event.sections.order(:order), partial: 'api/sections/section',
                                            as: :section
json.competitors event.competitors, partial: 'api/competitors/competitor',
                                    as: :competitor

json.tracks event.event_tracks, partial: 'api/round_tracks/round_track',
                                as: :round_track

json.rounds event.rounds, partial: 'api/rounds/round', as: :round
