<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use RuntimeException;

/** The other site couldn't be reached or broke off: worth trying again in a moment. */
final class RemoteUnavailable extends RuntimeException {}
