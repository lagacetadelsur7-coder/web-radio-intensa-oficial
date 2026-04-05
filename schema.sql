-- Create custom types for user levels and message status
CREATE TYPE user_level AS ENUM ('Oyente del Nilo', 'Voz de la Esfinge', 'Intenso Legend');
CREATE TYPE message_status AS ENUM ('pending', 'approved', 'rejected');

-- Chat Messages Table
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    nick TEXT NOT NULL,
    avatar_url TEXT,
    user_level user_level DEFAULT 'Oyente del Nilo'::user_level,
    status message_status DEFAULT 'approved'::message_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Radio Status Table (Single row for current status)
CREATE TABLE public.radio_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    current_topic TEXT NOT NULL DEFAULT 'Música 24/7',
    is_live BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Topics History Table
CREATE TABLE public.topics_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial radio status
INSERT INTO public.radio_status (current_topic, is_live) VALUES ('Bienvenidos a Radio Intensa', false);

-- Set up Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics_history ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Messages
CREATE POLICY "Public can read approved messages" ON public.chat_messages
    FOR SELECT USING (status = 'approved'::message_status);

CREATE POLICY "Public can insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);

-- Policies for Radio Status
CREATE POLICY "Public can read radio status" ON public.radio_status
    FOR SELECT USING (true);

CREATE POLICY "Admins can update radio status" ON public.radio_status
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for Topics History
CREATE POLICY "Public can read topics history" ON public.topics_history
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert topics history" ON public.topics_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
