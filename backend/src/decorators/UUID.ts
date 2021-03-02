import { PrimaryColumn } from 'typeorm'

export default () => PrimaryColumn({ default: 'public.uuid_generate_v4()' })
