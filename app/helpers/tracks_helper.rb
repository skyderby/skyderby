module TracksHelper
  def title(track)
    "#{t('tracks.show.title_track')} ##{track.id} | #{track_pilot_name(track)}"
  end

  def subheader(track)
    "#{t 'tracks.show.title_suit'}: #{track.suit ? track.suit_name : track.missing_suit_name}, @#{track.location}"
  end

  def track_presentation(track)
    "##{track.id} | #{track.recorded_at&.strftime('%Y-%m-%d')} | #{track.comment}"
  end

  def track_pilot_name(track)
    track.pilot ? track.pilot.name : track.name
  end

  def track_pilot_country_code(track)
    track.pilot ? track.pilot.country_code : ''
  end

  def track_place(track)
    track.place ? place_presentation(track.place) : track.location
  end

  def track_place_name(track)
    track.place ? track.place_name : track.location
  end

  def track_place_country_code(track)
    track.place&.country_code
  end

  def tracks_index
    render template: 'tracks/_index.json.jbuilder',
           formats: :json
  end

  def range_title(result)
    "#{result.range_from} - #{result.range_to}" if result
  end

  def track_visibility_options
    %w[public unlisted private].map do |visibility|
      [t("visibility.#{visibility}"), "#{visibility}_track"]
    end
  end

  def track_icons(track)
    capture do
      concat icon_tag('video-solid', class: 'icon--fw') if track.video

      if track.unlisted_track?
        concat tag.span(data: { controller: 'tooltip' }) {
          icon_tag('eye-slash-solid', class: 'icon--fw') +
            tag.span(t('visibility.unlisted'), class: 'for-screen-reader')
        }
      elsif track.private_track?
        concat tag.span(data: { controller: 'tooltip' }) {
          icon_tag('lock-solid', class: 'icon--fw') +
            tag.span(t('visibility.private'), class: 'for-screen-reader')
        }
      end
    end
  end

  def tracks_sort_header(order_field, order_direction, field, field_presentation)
    if field.casecmp?(order_field) && order_direction == :desc
      tag.a(href: url_for(index_params.merge(order: field)),
            data: { controller: 'tooltip' },
            rel: 'nofollow') do
        icon_tag('arrow-down-short-wide') +
          tag.span("Sort by #{field_presentation} ascending", class: 'for-screen-reader')
      end
    elsif field.casecmp?(order_field) && order_direction == :asc
      tag.a(href: url_for(index_params.merge(order: "-#{field}")),
            data: { controller: 'tooltip' },
            rel: 'nofollow') do
        icon_tag('arrow-up-short-wide') +
          tag.span("Sort by #{field_presentation} descending", class: 'for-screen-reader')
      end
    else
      tag.a(class: 'text-muted',
            href: url_for(index_params.merge(order: "-#{field}")),
            data: { controller: 'tooltip' },
            rel: 'nofollow') do
        icon_tag('arrow-down-short-wide') +
          tag.span("Sort by #{field_presentation} descending", class: 'for-screen-reader')
      end
    end
  end
end
