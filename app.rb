require 'sinatra'

class BasicAuth
  def initialize(app, options = {})
    @app = app
    @password = options[:password] || 'password'
    @user = options[:user] || 'admin'
  end

  def call(env)
    auth ||= Rack::Auth::Basic::Request.new(env)
    user, pass = auth.provided? && auth.basic? && auth.credentials
    unless user == @user && pass == @password
      [401, { 'WWW-Authenticate' => %(Basic realm="None shall pass!") }, ["Not authorized\n"]]
    else
      @app.call(env)
    end
  end
end

use BasicAuth, user: "admin", password: "transparency"

set :public, "dist"

get "/" do
  redirect "/index.html"
end
