module TracksHelper

  def title(track)
    "#{t 'tracks.show.title_track' } ##{track.id} | #{track.name}"
  end

  def header(track)
    " | #{t 'tracks.show.title_track'} ##{track.id}"
  end

  def subheader(track)
    "#{t 'tracks.show.title_suit'}: #{track.wingsuit.present? ? track.wingsuit.name : track.suit}, @#{track.location}"
  end

  def tracks_index
    render template: 'api/tracks/_index.json.jbuilder',
           formats: :json
  end

  def track_data_attr
    {data: {
      points: @track.charts_data, 
      height: {max: @track.max_height, min: @track.min_height},
      params: {
        locale: params[:locale], 
        from: (params[:f].nil? ? -1 : params[:f]),
        to: (params[:t].nil? ? -1 : params[:t])
        }.to_json,
      dict: {
        elev_dist: {
          titl: t('tracks.show.eldstch'),
          y: t('tracks.show.eldst_dst'),
          elev_s: t('tracks.show.eldst_el_s'),
          dist_s: t('tracks.show.eldst_dst_s'),
          height_s: t('tracks.show.eldst_h_s')          
        },
        speed: {
          titl: t('tracks.show.spdch'),
          y: t('tracks.show.spd_ax'),
          hs_s: t('tracks.show.spd_hs'),
          vs_s: t('tracks.show.spd_vs'),
          rhs_s: t('tracks.show.raw_ground_speed'),
          rvs_s: t('tracks.show.raw_vertical_speed'),
        },
        gr: {
          titl: t('tracks.show.grch'),
          gr_s: t('tracks.show.gr_s'),
          rgr_s: t('tracks.show.raw_gr'),
        },
        all: {
          titl: t('tracks.show.adc'),
          sp_y: t('tracks.show.adc_sp_y'),
          spd_y: t('tracks.show.adc'),
          ed_y: t('tracks.show.adc_ed_y'),
          gr_y: t('tracks.show.adc_gr_y'),
          hs_s: t('tracks.show.adc_hspd'),
          vs_s: t('tracks.show.adc_vspd'),
          gr_s: t('tracks.show.adc_gr_s'),
          height_s: t('tracks.show.adc_h_s'),
          dist_s: t('tracks.show.adc_dst'),
          elev_s: t('tracks.show.adc_ele')
        },
        units: {
          mph: t('units.mph'),
          kmh: t('units.kmh'),
          ft: t('units.ft'),
          m: t('units.m')
        }
      }.to_json
    }}
  end

  def track_edit_data_attr
    {data: {
      points: @track.heights_data,
      max_rel_time: @track.duration,
      range_from: @track.ff_start.nil? ? 0 : @track.ff_start,
      range_to: @track.ff_end.nil? ? @track.duration : @track.ff_end,
      suit: ({
        id: @track.wingsuit.id,
        name: @track.wingsuit.name
      } if @track.wingsuit),
      dict: {
        heights: {
          titl: t('.elev_chart'),
          elev_s: t('.elevation')
        },
        units: {
          m: t('units.m')
        }
      }.to_json
    }}
  end
end
