class LogbooksController < ApplicationController
  include LogbookScoped

  def show
    @logbook = Profiles::Logbook.new(logbook_profile, kind: params[:kind], year: params[:year], page: params[:page])
  end
end
