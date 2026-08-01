import preset from '../../../../vendor/filament/filament/tailwind.config.preset'

export default {
    presets: [preset],
    content: [
        './app/Filament/Owner/**/*.php',
        './resources/views/filament/owner/**/*.blade.php',
        './vendor/filament/**/*.blade.php',
    ],
}
