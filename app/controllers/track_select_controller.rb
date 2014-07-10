class TrackSelectController < ApplicationController

  def track_select
    require 'nokogiri'

    param_file = params[:track_file]
    
    # Проверим был ли выбран файл
    if param_file == nil
      redirect_to :controller => 'static_pages', :action => 'upload_error'
      return
    end

    @tracklist = []
    track_file = param_file.read

    content_type = param_file.content_type

    filename =  param_file.original_filename
    ext = filename.downcase[filename.length - 4..filename.length-1]
    if ext == '.csv'
      @tracklist << 'main'
    elsif ext == '.gpx'
      
      doc = Nokogiri::XML(track_file)
      doc.root.elements.each do |node|
        
        if node.node_name.eql? 'trk'
          
          track_name = ''
          h_arr = []
          t_arr = []
          
          node.elements.each do |node_attr|
            
            if node_attr.node_name.eql? 'trkseg'
              
              node_attr.elements.each do |trpoint|
                
                trpoint.elements.each do |point_node|
                  
                  h_arr << point_node.text.to_f if point_node.name.eql? 'ele'

                end # point node loop

              end # trpoint loop

            elsif node_attr.node_name.eql? 'name'
              track_name = node_attr.text.to_s
            end

          end # track attr loop
          
          @tracklist << {'name' => track_name, 'elev' => (h_arr.max - h_arr.min).to_i, 'duration' => h_arr.count}

        end # if name.eql? 'trk'
      
      end # doc root loop
    
    else

      redirect_to :controller => 'static_pages', :action => 'upload_error'
      return
    
    end

    # Проверим, содержит ли файл треки
    if @tracklist.count == 0 
      redirect_to :back
      return
    end

    flight_data = {'data' => track_file, 'ext' => ext, 
                    'name' => params[:name], 'suit' => params[:suit], 
                    'location' => params[:location], 'comment' => params[:comment]}

    @key = SecureRandom.uuid.to_s
    Rails.cache.write(@key, flight_data)

    # Если трек всего один - страницу выбора пропускаем
    if @tracklist.count == 1
      redirect_to :controller => 'tracks', :action => 'new', 
                    :cache_id => @key, :index => 0
    end
  end

  private
    #def track_select_params
    #  params.reauire(:track_select).permit(:name, :track_file)
    #end

end
